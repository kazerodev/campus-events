export function createEventController(eventService) {
  return {
    async list(req, res) {
      res.json(await eventService.list());
    },

    async getById(req, res) {
      res.json(await eventService.getById(req.valid.params.id));
    },

    async create(req, res) {
      const event = await eventService.create(req.valid.body);
      res.status(201).location(`/api/events/${event.id}`).json(event);
    },

    async update(req, res) {
      res.json(await eventService.update(req.valid.params.id, req.valid.body));
    },

    async remove(req, res) {
      await eventService.remove(req.valid.params.id);
      res.status(204).send();
    }
  };
}
