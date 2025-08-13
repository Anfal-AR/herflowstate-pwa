// src/lib/chart-config.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options for consistency across your app
export const defaultChartOptions: Partial<ChartOptions> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        }
      }
    },
    title: {
      display: false,
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 14
      },
      bodyFont: {
        family: 'Inter, system-ui, sans-serif',
        size: 12
      },
      cornerRadius: 8,
      padding: 12
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6
    },
    line: {
      tension: 0.4,
      borderWidth: 2
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        }
      }
    },
    y: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 11
        }
      }
    }
  }
};

// Color palette for consistent theming
export const chartColors = {
  primary: 'rgb(239, 68, 68)', // red-500
  secondary: 'rgb(34, 197, 94)', // green-500
  accent: 'rgb(168, 85, 247)', // violet-500
  info: 'rgb(59, 130, 246)', // blue-500
  warning: 'rgb(245, 158, 11)', // amber-500
  success: 'rgb(16, 185, 129)', // emerald-500
  
  // Gradient backgrounds
  primaryBg: 'rgba(239, 68, 68, 0.1)',
  secondaryBg: 'rgba(34, 197, 94, 0.1)',
  accentBg: 'rgba(168, 85, 247, 0.1)',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  successBg: 'rgba(16, 185, 129, 0.1)',
};

// Utility function to generate gradient datasets
export const createGradientDataset = (
  label: string,
  data: number[],
  color: string,
  backgroundColor: string,
  fill: boolean = true
) => ({
  label,
  data,
  borderColor: color,
  backgroundColor,
  tension: 0.4,
  fill,
  pointBackgroundColor: color,
  pointBorderColor: '#ffffff',
  pointBorderWidth: 2,
});

export default ChartJS;