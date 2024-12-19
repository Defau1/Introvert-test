import { ChangeDetectionStrategy, Component, computed, signal, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { openDB } from 'idb';

export interface Task {
  name: string;
  completed: boolean;
  subtasks?: Task[];
}

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [MatCheckboxModule, FormsModule, CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements OnInit {

  isDropdownOpen = false;
  db: any;

  constructor(private eRef: ElementRef) {}

  readonly task = signal<Task>({
    name: '4 воронки, 24 этапа',
    completed: false,
    subtasks: [
      { name: 'Продажи', completed: false },
      { name: 'Неразобранное', completed: true },
      { name: 'Переговоры', completed: false },
      { name: 'Принимают решение', completed: false },
      { name: 'Успешно', completed: false },
      { name: 'Сотрудники', completed: false },
      { name: 'Партнёры', completed: false },
      { name: 'Ивент', completed: false },
      { name: 'Входящие сообщения', completed: false },
    ],
  });

  async ngOnInit() {
    this.db = await openDB('task-db', 1, {
      upgrade(db) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      },
    });
    await this.loadState();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  readonly partiallyComplete = computed(() => {
    const task = this.task();
    if (!task.subtasks) return false;
    return task.subtasks.some(t => t.completed) && !task.subtasks.every(t => t.completed);
  });

  async update(completed: boolean, index?: number) {
    this.task.update(task => {
      if (index === undefined) {
        task.completed = completed;
        task.subtasks?.forEach(t => (t.completed = completed));
      } else {
        task.subtasks![index].completed = completed;
        task.completed = task.subtasks?.every(t => t.completed) ?? true;
      }
      return { ...task };
    });
    await this.saveState();
  }

  getStyle(index: number) {
    const colors = [null, '#99CCFD', '#FFFF99', '#FFCC66', '#CCFF66'];
    return index > 0 && index < colors.length ? { 'background-color': colors[index] } : {};
  }

  hasSelected(): boolean {
    return this.task().subtasks?.some(t => t.completed) ?? false;
  }

  getText(): string {
    const subtasks = this.task().subtasks ?? [];
    const selectedCount = subtasks.filter(t => t.completed).length;
    return `Выбрано: ${selectedCount} воронки, ${subtasks.length - selectedCount} этапов`;
  }

  async saveState() {
    await this.db.put('tasks', { id: 1, data: this.task() });
  }

  async loadState() {
    const savedTask = await this.db.get('tasks', 1);
    if (savedTask) {
      this.task.set(savedTask.data);
    }
  }
}



