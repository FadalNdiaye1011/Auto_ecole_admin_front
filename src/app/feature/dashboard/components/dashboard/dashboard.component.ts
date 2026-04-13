import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData, ActiviteFlux } from '../../interfaces/dashboard';
import { ToastService } from '../../../../core/services/toast.service';

Chart.register(...registerables);

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  isLoading = true;
  data: DashboardData | null = null;

  activeTopTab: 'cours' | 'examens' = 'cours';
  activeUserTab: 'depenses' | 'activite' = 'depenses';
  activeTauxTab: 'examen' | 'test' = 'examen';

  private revenusChart?: Chart;
  private coursCategChart?: Chart;
  private examenCategChart?: Chart;

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService
  ) {}

  get d(): DashboardData {
    return this.data!;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.revenusChart?.destroy();
    this.coursCategChart?.destroy();
    this.examenCategChart?.destroy();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        this.data = response.data;
        this.isLoading = false;
        setTimeout(() => {
          this.createRevenusChart();
          this.createCoursCategChart();
          this.createExamenCategChart();
        }, 50);
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Erreur lors du chargement du tableau de bord');
      }
    });
  }

  private createRevenusChart(): void {
    const canvas = document.getElementById('revenusChart') as HTMLCanvasElement;
    if (!canvas || !this.data) return;
    this.revenusChart?.destroy();

    this.revenusChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.data.revenus_mensuels.map(r => r.mois),
        datasets: [
          {
            type: 'bar',
            label: 'Cours',
            data: this.data.revenus_mensuels.map(r => r.revenus_cours),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 4,
          },
          {
            type: 'bar',
            label: 'Examens',
            data: this.data.revenus_mensuels.map(r => r.revenus_examens),
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 4,
          },
          {
            type: 'line',
            label: 'Total',
            data: this.data.revenus_mensuels.map(r => r.revenus_total),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointRadius: 3,
            borderWidth: 2,
          } as any
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${this.formatCurrency(ctx.parsed.y ?? 0)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              callback: (value) => this.formatShort(+value)
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  private createCoursCategChart(): void {
    const canvas = document.getElementById('coursCategChart') as HTMLCanvasElement;
    if (!canvas || !this.data) return;
    this.coursCategChart?.destroy();

    const cats = this.data.ventes_par_categorie.cours;
    this.coursCategChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.libelle),
        datasets: [{
          data: cats.map(c => c.total_ventes ?? 0),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 11 } } }
        },
        cutout: '60%'
      }
    });
  }

  private createExamenCategChart(): void {
    const canvas = document.getElementById('examenCategChart') as HTMLCanvasElement;
    if (!canvas || !this.data) return;
    this.examenCategChart?.destroy();

    const cats = this.data.ventes_par_categorie.examens;
    this.examenCategChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.libelle),
        datasets: [{
          data: cats.map(c => c.total_achats ?? 0),
          backgroundColor: CHART_COLORS.slice().reverse(),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 11 } } }
        },
        cutout: '60%'
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' FCFA';
  }

  formatShort(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(0) + 'k';
    return String(value);
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr.replace(' ', 'T'));
    const diff = Date.now() - date.getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1) return 'À l\'instant';
    if (m < 60) return `il y a ${m}min`;
    if (h < 24) return `il y a ${h}h`;
    if (d < 7) return `il y a ${d}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  getActivityLabel(item: ActiviteFlux): string {
    switch (item.type) {
      case 'achat_cours':      return `a acheté le cours « ${item.cours ?? 'inconnu'} »`;
      case 'achat_examen':     return `a acheté l'examen « ${item.examen ?? 'inconnu'} »`;
      case 'tentative_test':   return `a passé le test « ${item.test ?? 'inconnu'} »`;
      case 'tentative_examen': return `a tenté l'examen « ${item.examen ?? 'inconnu'} »`;
      case 'inscription':      return `s'est inscrit(e)`;
      default:                 return 'activité';
    }
  }

  getActivityBadge(type: string): { cls: string; label: string } {
    const map: Record<string, { cls: string; label: string }> = {
      achat_cours:      { cls: 'bg-blue-100 text-blue-700',    label: 'Achat cours' },
      achat_examen:     { cls: 'bg-purple-100 text-purple-700', label: 'Achat examen' },
      tentative_test:   { cls: 'bg-amber-100 text-amber-700',   label: 'Test' },
      tentative_examen: { cls: 'bg-indigo-100 text-indigo-700', label: 'Examen' },
      inscription:      { cls: 'bg-green-100 text-green-700',   label: 'Inscription' },
    };
    return map[type] ?? { cls: 'bg-gray-100 text-gray-600', label: type };
  }

  getActivityDotClass(type: string): string {
    const map: Record<string, string> = {
      achat_cours:      'bg-blue-500',
      achat_examen:     'bg-purple-500',
      tentative_test:   'bg-amber-500',
      tentative_examen: 'bg-indigo-500',
      inscription:      'bg-green-500',
    };
    return map[type] ?? 'bg-gray-400';
  }

  progressWidth(value: number): string {
    return Math.min(Math.max(value, 0), 100) + '%';
  }
}
