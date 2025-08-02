import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Rides per Hour (Last 24 Hours)',
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Hour of the Day'
      },
      ticks: {
        callback: function(value, index, values) {
          // Format the label to show only the hour (e.g., '14:00')
          const label = this.getLabelForValue(value);
          return new Date(label).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Rides'
      }
    }
  }
};

const RidesPerHourChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.hour),
    datasets: [
      {
        label: 'Rides',
        data: data.map(d => d.rides),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <div style={{ height: '300px' }}><Bar options={options} data={chartData} /></div>;
};

export default RidesPerHourChart;
