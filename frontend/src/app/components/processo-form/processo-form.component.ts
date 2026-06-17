import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Processo } from '../../models/processo.model';

@Component({
  selector: 'app-processo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './processo-form.component.html',
  styleUrl: './processo-form.component.scss',
})
export class ProcessoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProcessoFormComponent>);
  private readonly dialogData = inject<Processo | null>(MAT_DIALOG_DATA, { optional: true });

  readonly isEditing = this.dialogData !== null;
  readonly titulo = this.isEditing ? 'Editar Processo' : 'Novo Processo';

  // Signal para estado local do formulário (loading do save)
  readonly isSaving = signal(false);

  readonly statusOptions = [
    { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { value: 'SUSPENSO', label: 'Suspenso' },
    { value: 'CONCLUIDO', label: 'Concluído' },
  ];

  form: FormGroup;

  constructor() {
    const processo = this.dialogData;

    this.form = this.fb.group({
      numero_processo: [
        { value: processo?.numero_processo || '', disabled: !!processo },
        [Validators.required, Validators.minLength(1)],
      ],
      titulo: [processo?.titulo || '', [Validators.required, Validators.minLength(1)]],
      descricao: [processo?.descricao || ''],
      status: [processo?.status || 'EM_ANDAMENTO', Validators.required],
    });
  }

  salvar(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);

    const rawValue = this.form.getRawValue();
    const payload: Record<string, unknown> = {};

    if (!this.isEditing) {
      payload['numero_processo'] = rawValue.numero_processo?.trim();
    }
    payload['titulo'] = rawValue.titulo?.trim();
    payload['descricao'] = rawValue.descricao?.trim() || null;
    payload['status'] = rawValue.status;

    this.dialogRef.close(payload);
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}
