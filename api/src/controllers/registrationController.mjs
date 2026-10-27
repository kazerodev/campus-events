export function createRegistrationController(registrationService) {
  return {
    async list(req, res) {
      res.json(await registrationService.listForEvent(req.valid.params.id));
    },

    async create(req, res) {
      const registration = await registrationService.register(req.valid.params.id, req.valid.body);
      res.status(201).json(registration);
    }
  };
}
