
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSubmit: (token: string) => void;
}

const MapboxTokenInput = ({ onTokenSubmit }: MapboxTokenInputProps) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Mapbox Token Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            To display maps, please enter your Mapbox public token. You can get one for free at:
          </p>
          <a 
            href="https://mapbox.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            mapbox.com <ExternalLink className="h-3 w-3" />
          </a>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="pk.eyJ1..."
                className="font-mono text-xs"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!token.trim()}>
              Use Token
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapboxTokenInput;
