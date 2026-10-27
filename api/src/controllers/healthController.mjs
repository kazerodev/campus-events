export function createHealthController(healthService) {
  return {
    async get(req, res) {
      res.json(await healthService.check());
    }
  };
}
