import ClientRepository from "./clients.repositories.js";

class ClientService {
  static createClient = async (data) => {
    return await ClientRepository.createClient(data);
  };

  static getClientById = async (id) => {
    return await ClientRepository.getClientById(id);
  };

  static getAllClients = async (queryParams = {}) => {
    return await ClientRepository.getAllClients(queryParams);
  };

  static getClientByTelephone = async (telephone) => {
    return await ClientRepository.getClientByTelephone(telephone);
  };

  static updateClient = async (id, update) => {
    return await ClientRepository.updateClient(id, update);
  };

  static deleteClient = async (id) => {
    return await ClientRepository.deleteClient(id);
  };

  static deleteClientById = async (id) => {
    return await ClientRepository.deleteClient(id);
  };
}

export default ClientService;
