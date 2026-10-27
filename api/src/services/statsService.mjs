function getStatus(event, registered) {
  if (registered >= event.capacity) return 'full';
  if (new Date(event.startsAt) < new Date()) return 'past';
  return 'open';
}

export function createStatsService({ events, registrations, cache }) {
  return {
    getOccupancy() {
      return cache.getOrSet('stats', async () => {
        const allEvents = await events.findAll();
        const result = [];

        for (const event of allEvents) {
          const registered = await registrations.countByEvent(event.id);
          result.push({
            id: event.id,
            title: event.title,
            registered,
            capacity: event.capacity,
            occupancy: Math.round((registered / event.capacity) * 100) + '%',
            status: getStatus(event, registered)
          });
        }

        return result;
      });
    }
  };
}
