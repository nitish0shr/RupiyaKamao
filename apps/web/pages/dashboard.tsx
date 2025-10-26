import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Trade {
  id: string;
  symbol: string;
  action: string;
  price: number;
  quantity: number;
  createdAt: string;
}

interface Advice {
  id: string;
  symbol: string;
  recommendation: string;
  reason: string;
  createdAt: string;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [advice, setAdvice] = useState<Advice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const [tradesRes, adviceRes] = await Promise.all([
        fetch('/api/trades', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/advice', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (tradesRes.ok && adviceRes.ok) {
        const tradesData = await tradesRes.json();
        const adviceData = await adviceRes.json();
        setTrades(tradesData.trades || []);
        setAdvice(adviceData.advice || []);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Trading Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/tradelogs"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Trade Logs
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Trades Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Trades
                </h2>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {trades.length > 0 ? (
                    trades.slice(0, 5).map((trade) => (
                      <li key={trade.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {trade.symbol} - {trade.action}
                            </p>
                            <p className="text-sm text-gray-500">
                              {trade.quantity} @ ₹{trade.price}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-gray-500">
                      No trades yet
                    </li>
                  )}
                </ul>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <a
                  href="/tradelogs"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all trades →
                </a>
              </div>
            </div>

            {/* Trading Advice Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Trading Advice
                </h2>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {advice.length > 0 ? (
                    advice.slice(0, 5).map((item) => (
                      <li key={item.id} className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.symbol} - {item.recommendation}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-gray-500">
                      No advice available
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
