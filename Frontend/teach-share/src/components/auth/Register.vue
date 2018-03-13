<template>
<auth-page 
    submitFunctionName="Register"
    redirectText="Have an account? Login instead"
    redirectName="login"
    @submitAuth="register">

        
    <b-form-group 
        label="Email addess:"
        :invalid-feedback="emailFeedback"
        :state="emailValid">
        <b-form-input 
            type="email" 
            v-model.lazy="email"
        />
    </b-form-group>
    <b-form-group 
        label="Username:"
        :invalid-feedback="usernameFeedback"
        :state="usernameValid">
        <b-form-input 
            type="text" 
            v-model.trim="username"
        />
    </b-form-group>
    <b-form-group 
        label="Password (confirm password):"
        :invalid-feedback="passwordFeedback"
        :state="passwordValid">
        <b-form-input 
            type="password" 
            v-model="pw1"
        />
        <b-form-input 
            type="password" 
            v-model="pw2"
        />
    </b-form-group>


</auth-page>
</template>


<script>
import Vue from "vue";
import forEach from "lodash/forEach";
import AuthPage from "./AuthPage";
export default Vue.component("register",{
    components: {AuthPage,},
    data() {
        return {
            username: "",
            pw1: "",
            pw2: "",
            email: "",
        }
    },
    computed: {
        passwordValid(){
            var b1 = this.pw1.localeCompare(this.pw2) == 0;
            var b2 = this.pw1.length >= 8;
            var b3 = this.pw2.length >= 8;
            this.$log(b1 + b2 + b3 + (b1&&b2&&b1));   
            return this.pw1.localeCompare(this.pw2)==0 &&
                 this.pw1.length >= 8 && this.pw2.length >=8;
        },
        passwordFeedback(){
            if(this.pw1.localeCompare(this.pw2)){
                return "Passwords do not match.";
            }
            if(this.pw1.length < 8){
                return "Passwords must be at least 8 characters in length.";
            }
        },
        emailValid() {
            //TODO: do more meaningful email
            //check than something@something.something
            var regex = /\S+@\S+\.\S+/
            this.$log(regex.test(this.email));
            this.$log(this.regex);
            return regex.test(this.email);
        },
        emailFeedback() {
            return "That is not an email address.";
        },
        usernameValid() {

            return this.username.length >= 7 && 
                this.username.length <= 25;

        },
        usernameFeedback() {
            //TODO: check here for username exists - right now
            //it's only done on the server
            return "Usernames must be between 7 and 25 characters in length.";
        }
    },
    methods: {

        register() {
            this.$log("in register");

            if(this.emailValid && this.usernameValid && this.passwordValid){
                var vm = this;
                this.$log("creating user...");
                this.$store.dispatch("createUser", {
                    username: this.username,
                    password: this.pw1,
                    email: this.email,
                    
                }).then(function(ret) {
                    vm.$log("RETURNED: ", ret);
                    
                    vm.$router.push({name: "login"});
                })
                .catch(function(err) {
                    vm.$log("caught error!");
                    Object.keys(err).forEach(function(key){
                        vm.$log(key);
                        vm.$log(err[key]);
                    })
                    vm.$log(err);
                    vm.$log(err.response.data);
                    vm.$notifyDanger("There was a problem creating your account!<br>" + err.response.data.error.toString());
                });
    
            }else{
                var str = "There are one or more problems registering!<br>" +
                            (this.emailValid ? "" : (this.emailFeedback + "<br>") )+ 
                            (this.passwordValid ? "" : (this.passwordFeedback + "<br>")) + 
                            (this.usernameValid ? "" : (this.usernameFeedback + "<br>")) + 
                            "Please fix them and try again."
                this.$log(str);

                this.$notifyDanger(str );

            }
        }
    },

})

</script>

<style lang="scss" scoped>

</style>
