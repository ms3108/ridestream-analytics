import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Vehicle Type Distribution',
    },
  },
};

const VehicleDistributionChart = ({ data }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: '# of Rides',
        data: Object.values(data),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // Taxi
          'rgba(54, 162, 235, 0.6)', // Airplane
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <div style={{ height: '300px' }}><Pie data={chartData} options={options} /></div>;
};

export default VehicleDistributionChart;
