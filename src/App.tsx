import React, { useState, useEffect, ChangeEvent } from "react";
import "./index.css";

type Ticket = {
  departure_time: string;
  arrival_time: string;
  origin: string;
  destination: string;
  origin_name: string;
  destination_name: string;
  departure_date: string;
  arrival_date: string;
  price: number;
  stops: number;
  carrier: string;
};

type Filters = {
  stops0: boolean;
  stops1: boolean;
  stops2: boolean;
  stops3: boolean;
  all: boolean;
};

type ConversionRates = {
  [key: string]: number;
};

const stopOptions = [
  { label: "Без пересадок", value: 0 },
  { label: "1 пересадка", value: 1 },
  { label: "2 пересадки", value: 2 },
  { label: "3 пересадки", value: 3 },
];

const tkIcon = ''
const s7Icon = ''
const baIcon = ''
const suIcon = ''

const conversionRates: ConversionRates = {
  RUB: 1,
  USD: 0.01,
  EUR: 0.009,
};

const dating = (dateString: string) => {
  const date = new Date(dateString);
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${weekdays[date.getDay()]}`;
}

function App() {
  const [data, setData] = useState<Ticket[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("RUB");
  const [filters, setFilters] = useState<Filters>({
    stops0: false,
    stops1: false,
    stops2: false,
    stops3: false,
    all: true
  });

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const response = await fetch("/tickets.json");
        if (!response.ok) {
          throw new Error("Error to fetch data");
        }

        const result = await response.json();

        const sortedTickets = result.tickets.sort((a: Ticket, b: Ticket) => a.price - b.price);
        const filteredTickets = sortedTickets.filter((ticket: Ticket) => {
          return (
            (filters.all && (ticket.stops === 0 || ticket.stops === 1 || ticket.stops === 2 || ticket.stops === 3)) ||
            (filters.stops0 && ticket.stops === 0) ||
            (filters.stops1 && ticket.stops === 1) ||
            (filters.stops2 && ticket.stops === 2) ||
            (filters.stops3 && ticket.stops === 3)
          );
        });

        setData(filteredTickets);
      } catch (error) {
        setError("Some custom error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [filters]);

  if (loading) {
    return <h2>Загрузка...</h2>;
  }

  if (error) {
    return <h2>Ошибка: {error}</h2>;
  }

  const handleStopsFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFilters(prevFilters => {
      if (name === "all") {

        if (!prevFilters.stops0 && !prevFilters.stops1 && !prevFilters.stops2 && !prevFilters.stops3 && !checked) {
          return prevFilters;
        }

        return {
          ...prevFilters,
          all: checked,
          stops0: false,
          stops1: false,
          stops2: false,
          stops3: false,
        };
      } else {
        const newFilters = {
          ...prevFilters,
          [name]: checked,
          all: false,
        };

        const anyStopSelected = newFilters.stops0 || newFilters.stops1 || newFilters.stops2 || newFilters.stops3;
        if (!anyStopSelected) {
          newFilters.all = true;
        }

        return newFilters;
      }
    });
  };

  const converting = (p: number) => {
    return (p * conversionRates[currency]).toFixed(2);
  };
 
  return (
    <div style={{ display: 'flex', backgroundColor: 'lightgray'  }}>
      <div style={{ display: 'flex', flexDirection: 'column', margin: '15px 0 15px 15px', padding: 10, backgroundColor: 'white' }}>
        <>
          <h3>Валюта:</h3>
          <div style={{ display: 'flex' }}>
            {['RUB', 'USD', 'EUR'].map(i => (
              <label key={i}>
                <input
                  type="radio"
                  name="currency"
                  value={i}
                  checked={currency === i}
                  onChange={(e) => setCurrency(e.target.value)}
                />
                {i}
              </label>
            ))}
          </div>
        </>
        <>
          <p>Количество пересадок: </p>
            <label>
              <input
                type="checkbox"
                name={`all`}
                checked={filters.all}
                onChange={handleStopsFilterChange}
              />
              Все
            </label>
          {stopOptions.map((option) => (
            <label key={option.value}>
              <input
                type="checkbox"
                name={`stops${option.value}`}
                checked={filters[`stops${option.value}` as keyof Filters]}
                onChange={handleStopsFilterChange}
              />
              {option.label}
            </label>
          ))}
        </>
      </div>

      <div>
        {data ? (
          data.map((ticket, index) => {
            const pricing = converting(ticket?.price);
            const ending = ticket?.stops === 1 ? 'Пересадкa' : 'Пересадки' 
            const stopNaming = ticket?.stops + ' ' + ending
            const iconing = (ticket?.carrier === 'TK' && tkIcon) || (ticket?.carrier === 'S7' && s7Icon) || (ticket?.carrier === 'BA' && baIcon)  || (ticket?.carrier === 'SU' && suIcon) || ''

            return (
              <div key={index} className="ticket" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', margin: 15}}>
                <div style={{ display: 'flex', flexDirection: 'column', margin: 20 }}>
                  <img src={iconing} alt={`${ticket?.carrier}-air company logo`} style={{ margin: 10 }}/>
                  <button style={{ cursor: 'pointer', backgroundColor: 'orange', padding: '15px 30px', width: 200 }}>Price: {pricing} {currency}</button>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ margin: 10 }}>
                    <h2 style={{ fontSize: 36, margin: 0 }}>{ticket.departure_time}</h2>
                    <p>{ticket.origin}, {ticket.origin_name}</p>
                    <p style={{ fontSize: 12, color: 'gray' }}>{dating(ticket.departure_date)}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 20 }}>
                    <p style={{ margin: 0 }}>--------------------------{'>'}</p>
                    <p >{ticket.stops ? stopNaming : 'Прямой рейс'}</p>
                  </div>
                  <div  style={{ margin: 10 }}>
                    <h2 style={{ fontSize: 36, margin: 0 }}>{ticket.arrival_time}</h2>
                    <p>{ticket.destination_name}, {ticket.destination}</p>
                    <p style={{ fontSize: 12, color: 'gray' }}>{dating(ticket.arrival_date)}</p>
                  </div>
                </div>
              </div>
          )})
        ) : (
          <p>Нет доступных билетов</p>
        )}
      </div>
    </div>
  );
}

export default App;
