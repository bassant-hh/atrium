import React from 'react';
import { FaUtensils, FaPrint, FaBook, FaPencilAlt, FaBoxOpen } from 'react-icons/fa';
import ServiceCard from '../ServiceCard/ServiceCard';
import './Services.css';

const SERVICES_DATA = [
  {
    id: 'food',
    icon: FaUtensils,
    title: 'Food Delivery',
    description:
      'Hot meals from campus cafeterias and nearby restaurants delivered right to your lecture hall or dorm.',
  },
  {
    id: 'printing',
    icon: FaPrint,
    title: 'Document Printing',
    description:
      'Upload lecture slides, assignments, or research papers and get them printed and delivered to your hand.',
  },
  {
    id: 'books',
    icon: FaBook,
    title: 'Books & Manuals',
    description:
      'Course textbooks, lab manuals, and study guides requested and delivered within campus bounds.',
  },
  {
    id: 'stationery',
    icon: FaPencilAlt,
    title: 'Stationery Items',
    description:
      'Notebooks, pens, calculators, and exam essentials delivered whenever you are running low.',
  },
  {
    id: 'campus-delivery',
    icon: FaBoxOpen,
    title: 'Campus Parcel Relay',
    description:
      'Send or receive packages, forgotten items, or study notes between campus buildings effortlessly.',
  },
];

const Services = () => {
  return (
    <section id="services-section" className="services-section">
      <div className="services-container">
        <div className="services-header">
          <span className="services-header__tag">Campus Ecosystem</span>
          <h2 className="services-header__title">Tailored Services for Student Life</h2>
          <p className="services-header__desc">
            Makook integrates five vital student services into a single unified platform designed
            for maximum speed and simplicity.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES_DATA.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
