import clientModel from "./models/clients.models.js";

class ClientRepository {
  static createClient = async (data) => {
    return await clientModel.create(data);
  };

  static getClientById = async (id) => {
    return await clientModel.findById(id);
  };

  static getAllClients = async () => {
    return await clientModel.find();
  };

  static getClientByTelephone = async (telephone) => {
    return await clientModel.findOne({ telephone });
  };

  static getClientByEmail = async (email) => {
    return await clientModel.findOne({ email });
  };

  static updateClient = async (id, update) => {
    return await clientModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
  };

  static deleteClient = async (id) => {
    return await clientModel.findByIdAndDelete(id);
  };
}

export default ClientRepository;
