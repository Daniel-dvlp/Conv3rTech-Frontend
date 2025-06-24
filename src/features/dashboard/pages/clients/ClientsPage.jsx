import React from 'react';
import { Table } from 'react-bootstrap'

const ClientsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
      <p className="mt-4 text-gray-600">
        Aquí se mostrará el modulo de Clientes.
      </p>
      <table className="table table-hover">
        
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Handle</th>
          </tr>
        </thead>
        <tbody>   
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClientsPage;