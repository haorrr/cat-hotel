import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminStatsCard = ({ title, value, icon, color, linkTo }) => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="stats-value h2 mb-0">{value}</div>
            <div className="stats-title text-muted">{title}</div>
          </div>
          <div className={`stats-icon bg-${color} text-white p-3 rounded`}>
            {icon}
          </div>
        </div>
      </Card.Body>
      {linkTo && (
        <Card.Footer className="bg-white border-0">
          <Link to={linkTo} className="text-decoration-none">
            Xem chi tiết
          </Link>
        </Card.Footer>
      )}
    </Card>
  );
};

export default AdminStatsCard;