// DTO pour la récupération de tous les utilisateurs

class GetAllUsersDto {
    constructor(id, nom, prenom, email, telephone, role) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.role = role;
    }
}

export default GetAllUsersDto;