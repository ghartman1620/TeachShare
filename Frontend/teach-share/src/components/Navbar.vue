<template>
    <nav class="navbar fixed-top navbar-inverse navbar-expand-lg navbar-dark dark-green">
            <div class="container">
            <!-- brand section -->
            <router-link class="navbar-brand" to="/"><img class="img-responsive ts-logo" src="/static/ts-logo.png"></router-link>

            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">


                    <!-- create a post link -->
                    <li class="nav-item">
                        <router-link class="nav-link" to="/create">Create Post</router-link>
                    </li>

                    <!-- just an example dropdown -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="Account Profile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            Profile
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <router-link class="dropdown-item" :to="{name: 'dashboard'}">Your post feed</router-link>
                            <a class="dropdown-item" href="#">Your posts</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="#">Account details</a>
                        </div>
                    </li>
                </ul>

                <!-- search box component -->
                <div class="search-container">
                    <search-box></search-box>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import Vue from "vue";
import SearchBox from "./SearchBox.vue";

export default Vue.component("nav-bar", {
    components: { SearchBox },
    props: ["query"],
    data() {
        return {};
    }
});
</script>


<style lang="scss" scoped>

$nav-background-color: #3b896a;
$nav-background-color-hover: #204738;
$nav-text-color: rgba(255, 255, 255, 1);
$nav-hover-color: rgba(255, 255, 255, .5);

.router-link-active {
    font-weight: bold;
    color: rgba(255, 255, 255, 1) !important; 
    // text-decoration-style:solid;
    // text-decoration-line: underline;
}

.dropdown-menu {
    background-color: $nav-background-color;
}

.dropdown-item {
    font-weight: 400;
    background-color: $nav-background-color;
    color: $nav-text-color;
}

.dropdown-item:hover{
    background-color: $nav-background-color-hover;
    color: $nav-text-color;
}

.nav-link {
    color: rgba(255, 255, 255, 0.924) !important;
    font-weight: bold;
}

.nav-link:hover{
    // color: rgba(255, 255, 255, .5) !important;
    background-color: $nav-background-color-hover;
    font-weight: bold;
}

.dark-green {
    background-color: #3b896a;
}
.ts-logo {
    height: 40px;
    padding-bottom: 3px;
    width: auto;
}
.ts-logo:hover {
    background-color:$nav-background-color-hover;
}

.navbar {
    border-bottom: 2px solid darken($nav-background-color, 10%);
    height: 60px;
}

@media only screen and (max-width : 992px) {
    .navbar-collapse {
        background: darken($nav-background-color, 10%);
    }
}


.collapsed {
    background: darken($nav-background-color, 10%);
}

.nav-item > a {
    padding-left: 20px;
}

.search-container > form {
    padding-left: 20px;
}

</style>
