import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaFilter, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import adminService from '../../api/adminService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when filter changes or search term changes
  useEffect(() => {
    let result = [...users];
    
    // Filter by role
    if (filter !== 'all') {
      result = result.filter(user => user.role === filter);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [filter, searchTerm, users]);

  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'user':
        return <Badge bg="primary">Khách hàng</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý người dùng</h2>
          <p className="text-muted">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="user-filter d-flex justify-content-between align-items-center mb-4">
            <div className="search-box" style={{ width: '300px' }}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Form.Group>
            </div>
            
            <div className="d-flex align-items-center">
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="all">Tất cả người dùng</option>
                <option value="user">Khách hàng</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Button 
                variant="outline-secondary"
                className="ms-2"
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
              >
                <FaFilter className="me-1" /> Xóa bộ lọc
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải dữ liệu người dùng...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar bg-light rounded-circle p-2 me-2">
                              <FaUser className="text-primary" />
                            </div>
                            <div>{user.name}</div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaEnvelope className="text-muted me-2" />
                            {user.email}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaPhone className="text-muted me-2" />
                            {user.phone || 'N/A'}
                          </div>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="text-muted me-2" />
                            {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagement;