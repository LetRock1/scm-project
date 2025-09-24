import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('productId') || searchParams.get('product_id') || searchParams.get('id');
    if (id) {
      navigate(`/verify/${id}`, { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
};

export default VerifyRedirect;
