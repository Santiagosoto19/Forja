import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
)

export const chartColors = {
  primary: '#00F0FF',
  accent: '#2563EB',
  success: '#10B981',
  warning: '#F97316',
  danger: '#EF4444',
  grid: '#1F2937',
  tick: '#9CA3AF',
  title: '#F9FAFB',
  surface: '#111111',
}

export const muscleChartColors = {
  chest: '#00F0FF',
  back: '#2563EB',
  legs: '#10B981',
  shoulders: '#F97316',
  arms: '#EF4444',
  core: '#8B5CF6',
}

export const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111111',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: '#1F2937',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: chartColors.grid, drawBorder: false },
      ticks: { color: chartColors.tick, font: { size: 11 } },
    },
    y: {
      grid: { color: chartColors.grid, drawBorder: false },
      ticks: { color: chartColors.tick, font: { size: 11 } },
    },
  },
}
