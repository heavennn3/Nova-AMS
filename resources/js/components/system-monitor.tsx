import { useEffect, useState } from 'react';
import { Cpu, HardDrive, MemoryStick } from 'lucide-react';

export function SystemMonitor() {
    const [stats, setStats] = useState({ cpu: '0.0', ram: '0.0', disk: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/system/monitoring');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch system stats", error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center space-x-4 text-[11px] font-medium text-muted-foreground ml-auto bg-muted/30 px-3 py-1 rounded-full border border-border/50">
            <div className="flex items-center" title="CPU Usage">
                <Cpu className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                <span className="w-9">{stats.cpu}%</span>
            </div>
            <div className="flex items-center" title="RAM Usage">
                <MemoryStick className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                <span className="w-9">{stats.ram}%</span>
            </div>
            <div className="flex items-center" title="Disk Usage">
                <HardDrive className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                <span className="w-8">{stats.disk}%</span>
            </div>
        </div>
    );
}
