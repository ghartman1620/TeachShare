<template>
    <div class="card permission-add">
        <h3>
            Current users who can edit this post
        </h3>
        <div v-for="(user,index) in users" :key="user.pk">
            {{user}}
            <b-button variant="danger" size="sm" @click="remove(index)">remove</b-button>
        </div>
        <b-form @submit.prevent="addUser">
            <b-form-group 
                label="Add a user as a collaborator">
                <b-form-input v-model="newUser" type="text" placeholder="username"/>
                <b-button type="submit" variant="primary">Submit</b-button>
                <b-button variant="danger" @click="returnToEdit">Back to Post</b-button>
            </b-form-group>
        </b-form>
        
    </div>

</template>
<script lang="ts">
import Vue from "vue";
import {Component, Prop} from "vue-property-decorator";
import {State} from "vuex-class";
import api from "../api";
import getCurrentPost from "../store_modules/PostCreateService";
import getLoggedInUser from "../store_modules/UserService";

@Component({
    name: "permission-add",
})
export default class PermissionAdd extends Vue {
    @State("create") postState;
    @State("user") userState;

    users: any[] = [];
    newUser: string = "";

    public returnToEdit(){
        this.$router.push({name: "create"});
    }
    public created() {
        var vm: PermissionAdd = this;

        //I'm so godamn frustrated.
        //Fuck sake.
        //writing this makes me want to slit my throat
        if(parseInt(this.userState.user.pk) !== parseInt(this.postState.post.user) &&
           this.userState.user.pk !== this.postState.post.userPk &&
           parseInt(this.userState.user.pk) !== this.postState.post.userPk && 
            this.userState.user.pk !== parseInt(this.postState.post.userPk)){

            console.log(this.userState.user.pk);
            console.log(this.postState.post.userPk);
            this.$notifyDanger("Only the owner of a post may change its permissions. If you want to invite a new collaborator, ask the owner of this post.");
            this.$router.push({name: "create"});
        }
        api.get('/users/?post=' + this.postState.post.pk).then(users => {
            vm.users = users.data.map(u => u.username);
        })
    }
    public addUser() {
        console.log("AH FUCK");
        
        
        var index: number = this.users.length;
        this.users.push(this.newUser);
        
        api.post('/perm/', {
            action: "grant",
            permission: "change",
            post: this.postState.post.pk,
            users: [this.newUser]
        }).then().catch(err => {
            
            this.$notifyDanger("user " + this.users.splice(index,1) + " does not exist.");
           
        });
        this.newUser = "";
        
    }
    public remove(index: number) {
        api.post('/perm/', {
            action: "revoke",
            permission: "change",
            post: this.postState.post.pk,
            users: [this.users[index]]
        }).then(resp => {
            this.$notifySuccess("User " + this.users[index] + " removed as a collaborator.");
            this.users.splice(index,1);

        }).catch(err => {
            console.log(err);
            console.log(err.response);
            this.$notifyDanger("An error occured removing user "  + this.users[index] + ": " + err.response.data.error);
        })
    }

}

</script>

<style lang="scss" scoped>
.permisison-add {
    background-color: #96e6b3;
}
</style>