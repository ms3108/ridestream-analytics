import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Active Vehicles (Last 60 Mins)',
    },
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'minute',
        tooltipFormat: 'HH:mm',
        displayFormats: {
          minute: 'HH:mm'
        }
      },
      title: {
        display: true,
        text: 'Time'
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Active Vehicles'
      }
    }
  }
};

const ActiveRidesChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Active Vehicles',
        data: data.map(d => d.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
        tension: 0.4
      },
    ],
  };

  return <div style={{ height: '300px' }}><Line options={options} data={chartData} /></div>;
};

export default ActiveRidesChart;
