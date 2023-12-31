import {GithubUser} from './GithubUser.js'

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    load() {
        this.users = JSON.parse(localStorage.getItem('@github-favorites')) || []
    }

    save() {
        localStorage.setItem('@github-favorites', JSON.stringify(this.users))
    }

    async add(username) {
        try {

            const userExist = this.users.find(user => user.login === username)

            if (userExist) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)
 
             if(user.login === undefined) {
                 throw new Error('Usuário não encontrado!')
             }
         
             this.users = [user, ...this.users]
             this.update()
             this.save()
            } catch(error) {
                alert(error.message)
            }
    }

    delete(user){
        this.users = this.users.filter((entry) => {
            return entry !== user        
        })
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        this.tbody = this.root.querySelector("tbody")
        this.update()
        this.onAdd()
    }

    onAdd() {
        const input = this.root.querySelector('.search-container input')
        const handleClickOrEnter = () => {
            const { value } = input
            this.add(value)
        }
    
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleClickOrEnter()
            }
        })
    
        this.root.querySelector('.search-container button').onclick = handleClickOrEnter;
    }
    

    update() {
        this.removeAllUsers()
        this.users.forEach(user  => {
            const row = this.creatRow(user)
            row.querySelector('.btn-remove').onclick = () => {
                const isOk = confirm(`Deseja apagar ${user.name} da sua lista de favoritos?`)
                if(isOk) {
                    this.delete(user)
                }
            }
            this.tbody.append(row)
        })
    }

    creatRow(user) {
        const tr = document.createElement("tr")
        tr.innerHTML = 
        `
        <td class="user">
            <img src="https://github.com/${user.login}.png" alt="Imagem de ${user.name}">
            <a href="https://github.com/${user.login}">
                <p>${user.name}</p>
                <span>/${user.login}</span>
            </a>
        </td>
        <td>
            ${user.public_repos}     
        </td>
        <td>
            ${user.followers}
        </td>
        <td>
            <button class="btn-remove">Remover</button>
        </td>
        `
        return tr
    }

    removeAllUsers() {
        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove()
        })
    }
}