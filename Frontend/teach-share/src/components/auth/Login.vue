<template>
<auth-page 
    submitFunctionName="login"
    redirectText="Need an account? Register instead"
    redirectName="register"
    @submitAuth="login"
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



<script>
import AuthPage from "./AuthPage";
export default {
    name: "login",
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
        },

    },
    methods: {
        login: function(event) {
            console.log("IN LOGIN");
            var obj =  { username: this.username, pw: this.pw, persist: this.persist};
            console.log(obj);
            var vm = this;
            this.$store.dispatch("login", obj)
            .then(function(token) {
                console.log(token);
                console.log(vm.$cookie.get("token"))
                vm.$router.push({name: "create"});
            })
            .catch(function(err){
                console.log(err.response);
                vm.$notifyDanger("You could not login!<br>" + err.response.data.error_description);
            }); 
        },
    },
}
</script>

<style scoped>



</style>