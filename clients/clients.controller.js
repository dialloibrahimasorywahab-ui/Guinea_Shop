import ClientService from "./clients.service.js";

class ClientController {
  static createClient = async (req, res) => {
    try {
      const newClient = await ClientService.createClient(req.body);
      return res.status(201).json({
        success: true,
        data: newClient,
        message: "Client créé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getAllClients = async (req, res) => {
    try {
      const clients = await ClientService.getAllClients(req.query);
      return res.status(200).json({ success: true, data: clients });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  static getClientById = async (req, res) => {
    try {
      const client = await ClientService.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ success: false, error: "Client introuvable" });
      }
      return res.status(200).json({ success: true, data: client });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static getClientByTelephone = async (req, res) => {
    try {
      const { telephone } = req.params;
      const client = await ClientService.getClientByTelephone(telephone);
      if (!client) {
        return res.status(404).json({ success: false, error: "Client introuvable avec ce numéro" });
      }
      return res.status(200).json({ success: true, data: client });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static updateClient = async (req, res) => {
    try {
      const updatedClient = await ClientService.updateClient(req.params.id, req.body);
      if (!updatedClient) {
        return res.status(404).json({ success: false, error: "Client introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: updatedClient,
        message: "Client mis à jour avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };

  static deleteClient = async (req, res) => {
    try {
      const deletedClient = await ClientService.deleteClientById(req.params.id);
      if (!deletedClient) {
        return res.status(404).json({ success: false, error: "Client introuvable" });
      }
      return res.status(200).json({
        success: true,
        data: deletedClient,
        message: "Client supprimé avec succès",
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  };
}

export default ClientController;
