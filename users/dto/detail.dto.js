// DTO pour la récupération de tous les utilisateurs

class GetAllUsersDto {
  constructor(id, login, nom, prenom, email, telephone, role) {
    this.id = id;
    this.login = login;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.telephone = telephone;
    this.role = role;
  }
}

export default GetAllUsersDto;