import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Processo, CreateProcessoPayload, UpdateProcessoPayload } from '../models/processo.model';

const API_URL = 'http://localhost:3000/api/processos';

@Injectable({ providedIn: 'root' })
export class ProcessosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Processo[]> {
    return this.http.get<Processo[]>(API_URL);
  }

  buscarPorId(id: number): Observable<Processo> {
    return this.http.get<Processo>(`${API_URL}/${id}`);
  }

  criar(payload: CreateProcessoPayload): Observable<Processo> {
    return this.http.post<Processo>(API_URL, payload);
  }

  atualizar(id: number, payload: UpdateProcessoPayload): Observable<Processo> {
    return this.http.put<Processo>(`${API_URL}/${id}`, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
