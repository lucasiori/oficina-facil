import React, { useState, useEffect } from 'react';
import { parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import api from '~/services/api';

import {
  formatToPhone,
  formatToCpf,
  formatToDecial,
  formatToAddress,
} from '~/utils/format';

import {
  Wrapper,
  Header,
  CompanyInfo,
  CustomerInfo,
  ServiceOrderInfo,
  DateIssue,
  Content,
} from './styles';

import logo from '~/assets/logo.png';

export default function ServiceOrderPrinting() {
  const [serviceOrder, setServiceOrder] = useState(undefined);

  useEffect(() => {
    async function loadServiceOrder(id) {
      const response = await api.get(`service_orders/${id}`);

      /**
       * A tabela de itens deve possuir no mínimo 17 itens
       */
      while (response.data.items.length < 17) {
        const lastId = response.data.items[response.data.items.length - 1].id;

        response.data.items.push({
          id: lastId + 1,
        });
      }

      setServiceOrder(response.data);
    }

    const serviceOrderId = new URL(window.location.href).searchParams.get(
      'service_order_id'
    );

    if (serviceOrderId) {
      loadServiceOrder(serviceOrderId);
    }
  }, []);

  if (!serviceOrder) {
    return <Wrapper />;
  }

  return (
    <Wrapper>
      <Header>
        <div className="logo">
          <img src={logo} alt="Logo" />

          <CompanyInfo>
            <h3>NOME DO ESTABELECIMENTO</h3>
            <span>Endereço</span>
            <span>(00) 00000-0000</span>
          </CompanyInfo>
        </div>

        <div className="service-order">
          <ServiceOrderInfo>
            <div className="service-order-number">
              <h1>Ordem de Serviço - nº {serviceOrder.id}</h1>
            </div>

            <div className="service-order-date">
              <strong>
                {serviceOrder.date &&
                  format(parseISO(serviceOrder.date), 'dd/MM/yyyy', {
                    locale: pt,
                  })}
              </strong>
            </div>
          </ServiceOrderInfo>

          <CustomerInfo>
            <div>
              <strong>Cliente: </strong>
              <span>{serviceOrder.customer.name}</span>
            </div>

            <div>
              <strong>Endereço: </strong>
              <span>{formatToAddress(serviceOrder.customer)}</span>
            </div>

            <div>
              <div>
                <strong>Telefone: </strong>
                <span>
                  {serviceOrder.customer.phone
                    ? formatToPhone(serviceOrder.customer.phone)
                    : 'Não informado'}
                </span>
              </div>

              <div>
                <strong>CPF: </strong>
                <span>{formatToCpf(serviceOrder.customer.cpf)}</span>
              </div>
            </div>

            <div>
              <div>
                <strong>Veículo: </strong>
                <span>
                  {serviceOrder.customer_car &&
                    `${serviceOrder.customer_car.model}, ${serviceOrder.customer_car.manufacture_year}`}
                </span>
              </div>

              <div>
                <strong>Placa: </strong>
                <span>
                  {serviceOrder.customer_car &&
                    serviceOrder.customer_car.license_plate}
                </span>
              </div>
            </div>
          </CustomerInfo>
        </div>
      </Header>

      <Content>
        <table cellSpacing="0">
          <thead>
            <tr>
              <th className="amountColumn">QUANTIDADE</th>
              <th className="descriptionColumn">DESCRIÇÃO</th>
              <th className="valueColumn">VALOR (R$)</th>
            </tr>
          </thead>
          <tbody>
            {serviceOrder.items &&
              serviceOrder.items.map((item) => (
                <tr key={String(item.id)}>
                  <td>{item.amount}</td>
                  <td>{item.description}</td>
                  <td>{item.value ? formatToDecial(item.value) : ''}</td>
                </tr>
              ))}

            <tr className="totalRow">
              <td colSpan="2">TOTAL</td>
              <td>{formatToDecial(serviceOrder.total_value)}</td>
            </tr>
          </tbody>
        </table>

        <DateIssue>
          <i>Emitido em: {format(new Date(), "dd/MM/yyyy' 'HH:mm:ss")}</i>
        </DateIssue>
      </Content>
    </Wrapper>
  );
}
