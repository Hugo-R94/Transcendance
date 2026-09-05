import React from "react";

export interface LeaderboardCardProps<T> {
    player: T;
    rank: number;
    color: string;
}

interface LeaderboardSectionProps<T> {
    data: T[];
    limit: number;
    offset?: number;
    getColor: (index: number) => string;
    CardComponent: React.ComponentType<LeaderboardCardProps<T>>;
    EmptyCard?: React.ComponentType<{ rank: number; color: string }>; // Optionnel : carte personnalisée pour les cases vides
}

// Carte vide par défaut pour garder la structure visuelle
function DefaultEmptyCard({ color }: { rank: number; color: string }) {
    return (
        <div className={`${color} opacity-10 w-full h-full rounded-2xl flex items-center justify-center border-2 border-dashed border-white/30`}>
            {/* Laissez vide ou ajoutez du texte/loader */}
        </div>
    );
}

export function LeaderboardSection<T extends { user_id: string }>({
    data,
    limit,
    offset = 0,
    getColor,
    CardComponent,
    EmptyCard = DefaultEmptyCard,
}: LeaderboardSectionProps<T>) {
    const slots = Array.from({ length: limit }).map((_, i) => data[offset + i]);

    return (
        <div className="flex-1 flex flex-col gap-y-2 min-h-0 h-full w-full">
            {slots.map((player, index) => {
                const globalIndex = offset + index;
                const rank = globalIndex + 1;
                const color = getColor(index);

                return (
                    <div key={player?.user_id ?? `empty-slot-${globalIndex}`} className="flex-1 min-h-0 w-full">
                        {player ? (
                            <CardComponent
                                player={player}
                                rank={rank}
                                color={color}
                            />
                        ) : (
                            <EmptyCard
                                rank={rank}
                                color={color}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}