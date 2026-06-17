import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProcessosService } from './processos.service';
import type { Processo } from '../models/processo.model';

const API_URL = 'http://localhost:3000/api/processos';

const mockProcesso: Processo = {
  id: 1,
  numero_processo: '0001-01.2026',
  titulo: 'Processo Teste',
  descricao: 'Descrição de teste',
  status: 'EM_ANDAMENTO',
  data_criacao: '2026-06-17 10:00:00',
};

const mockLista: Processo[] = [mockProcesso];

describe('ProcessosService', () => {
  let service: ProcessosService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProcessosService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify(); // Verifica se não há requests pendentes
  });

  it('listar() — faz GET e retorna lista de processos', () => {
    service.listar().subscribe((processos) => {
      expect(processos).toEqual(mockLista);
    });

    const req = httpTesting.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockLista);
  });

  it('buscarPorId() — faz GET com ID e retorna um processo', () => {
    service.buscarPorId(1).subscribe((processo) => {
      expect(processo).toEqual(mockProcesso);
    });

    const req = httpTesting.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProcesso);
  });

  it('criar() — faz POST com payload e retorna o processo criado', () => {
    const payload = {
      numero_processo: '0001-01.2026',
      titulo: 'Processo Teste',
    };

    service.criar(payload).subscribe((processo) => {
      expect(processo).toEqual(mockProcesso);
    });

    const req = httpTesting.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockProcesso);
  });

  it('atualizar() — faz PUT com payload e retorna o processo atualizado', () => {
    const payload = { titulo: 'Novo Título' };
    const atualizado = { ...mockProcesso, titulo: 'Novo Título' };

    service.atualizar(1, payload).subscribe((processo) => {
      expect(processo.titulo).toBe('Novo Título');
    });

    const req = httpTesting.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(atualizado);
  });

  it('deletar() — faz DELETE com ID', () => {
    service.deletar(1).subscribe((result) => {
      expect(result).toBeNull(); // DELETE retorna void/null
    });

    const req = httpTesting.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // HTTP 204 retorna corpo nulo
  });
});
