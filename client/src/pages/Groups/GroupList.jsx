import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IconPlus } from '@tabler/icons-react';

function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await api.fetchGroups();
        setGroups(response.data.Group || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  const groupTypeClasses = {
    'Asset': 'badge-asset',
    'Liability': 'badge-liability',
    'Equity': 'badge-equity',
    'Revenue': 'badge-revenue',
    'Expense': 'badge-expense'
  };

  if (loading) {
    return <div className="loading">Loading groups...</div>;
  }

  return (
    <div className="group-list">
      <div className="page-header">
        <h1>Account Groups</h1>
        <Link to="/create-group" className="button">
          <IconPlus size={16} />
          <span>Create Group</span>
        </Link>
      </div>
      
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group.id}>
                <td>{group.id}</td>
                <td>{group.name}</td>
                <td>{group.description}</td>
                <td>
                  <span className={`badge ${groupTypeClasses[group.groupType] || ''}`}>
                    {group.groupType}
                  </span>
                </td>
                <td>{group.creator.substring(0, 10)}...</td>
                <td>
                  <Link to={`/groups/${group.id}`} className="button button-secondary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No groups found. Create your first group using the button above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GroupList;