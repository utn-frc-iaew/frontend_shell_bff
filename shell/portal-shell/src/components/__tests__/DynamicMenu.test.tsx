import { render, screen } from '@testing-library/react';
import DynamicMenu from '@/components/DynamicMenu';

describe('DynamicMenu', () => {
  it('shows all items for admin role', () => {
    render(<DynamicMenu roles={['admin']} />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Reportes/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuración/i)).toBeInTheDocument();
  });

  it('shows only dashboard for users with no roles', () => {
    render(<DynamicMenu roles={[]} />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.queryByText(/Configuración/i)).not.toBeInTheDocument();
  });

  it('shows users section for user-manager role', () => {
    render(<DynamicMenu roles={['user-manager']} />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Usuarios/i)).toBeInTheDocument();
    expect(screen.queryByText(/Configuración/i)).not.toBeInTheDocument();
  });
});
