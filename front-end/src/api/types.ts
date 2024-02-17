export type Games = [
  {
    _id: string;
    name: string;
    participants: [
      {
        userId: string;
        tokens: number;
      },
    ];
    winnerId: string;
    prize: number;
    minParticipants: number;
    maxParticipants: number;
    timestampStart: number;
    timestampEnd: number;
    embeddedUrl: string;
  },
];
