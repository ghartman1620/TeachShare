<template>
<auth-page 
    submitFunctionName="loginSubmit"
    redirectText="Need an account? Register instead"
    redirectName="register"
    @submitAuth="loginSubmit"
    >
    <!-- logo -->
    
        <b-form-group 
            label="Username"
            :state="username.length != 0"
            invalid-feedback="Enter a username."
        >
            <b-form-input type="text" placeholder="Username" v-model="username"/>
        </b-form-group>

        <b-form-group
            label="Password"
            :state="pw.length != 0"
            invalid-feedback="Enter a password."
        >
            <b-form-input type="password" placeholder="password" v-model="pw"/>
        </b-form-group>
        <b-form-checkbox type="checkbox" v-model="persist">Keep me logged in</b-form-checkbox>

    
</auth-page>

</template>



<script lang="ts">
import AuthPage from "./AuthPage";
import UserMixin from "../../user";
export default {
    name: "login",
    mixins: [UserMixin],
    data: function(){
        return {
            username: "",
            pw: "",
            persist: false,
        }
    },
    computed: {
        token() {
            return this.$store.state.user.token;
        }

    },
    methods: {
        loginSubmit: function(event) {
            var vm = this;
            this.login(this.username, this.pw, this.persist)
            .then(function() {
                vm.$router.push({name: "create"});
            })
            .catch(function(err){
                console.log(err);
                vm.$notifyDanger("You could not login<br>" + err.response.data.error_description);
            }); 
        },
    },
    mounted() {

        
    }
}
</script>

<style scoped>



</style>