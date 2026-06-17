import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { DashboardComponent } from './dashboard.component';
import { ProcessosActions } from '../../store/processos.actions';
import type { Processo } from '../../models/processo.model';

const FEATURE_KEY = 'processos';

const mockProcessos: Processo[] = [
  {
    id: 1,
    numero_processo: '0001-01.2026',
    titulo: 'Ação de Cobrança',
    descricao: 'Descrição',
    status: 'EM_ANDAMENTO',
    data_criacao: '2026-06-17',
  },
  {
    id: 2,
    numero_processo: '0002-02.2026',
    titulo: 'Mandado de Segurança',
    descricao: null,
    status: 'SUSPENSO',
    data_criacao: '2026-06-16',
  },
];

function buildState(overrides: Record<string, unknown> = {}) {
  return {
    [FEATURE_KEY]: {
      processes: [] as Processo[],
      loading: false,
      saving: false,
      error: null as string | null,
      ...overrides,
    },
  };
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;
  let dispatchSpy: jest.SpyInstance;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        MatDialogModule,
        MatSnackBarModule,
      ],
      providers: [
        provideHttpClient(),
        provideMockStore({ initialState: buildState() }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = jest.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve disparar ação de load ao iniciar', () => {
    expect(dispatchSpy).toHaveBeenCalledWith(ProcessosActions.load());
  });

  it('deve exibir estado vazio quando não há processos', () => {
    store.setState(buildState({ processes: [] }));
    fixture.detectChanges();

    const emptyEl = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.nativeElement.textContent).toContain('Nenhum processo cadastrado');
  });

  it('deve exibir loading spinner quando estiver carregando', () => {
    store.setState(buildState({ loading: true }));
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('deve exibir tabela com processos quando houver dados', () => {
    store.setState(buildState({ processes: mockProcessos }));
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tr[mat-row]'));
    expect(rows.length).toBe(2);

    const firstRow = rows[0].nativeElement.textContent;
    expect(firstRow).toContain('0001-01.2026');
    expect(firstRow).toContain('Ação de Cobrança');
  });

  it('deve exibir status chips com classes corretas', () => {
    store.setState(buildState({ processes: mockProcessos }));
    fixture.detectChanges();

    const chips = fixture.debugElement.queryAll(By.css('.status-chip'));
    expect(chips.length).toBe(2);
    expect(chips[0].nativeElement.classList).toContain('EM_ANDAMENTO');
    expect(chips[1].nativeElement.classList).toContain('SUSPENSO');
  });
});
