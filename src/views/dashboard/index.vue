<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import adminDashboard from "./admin";
import editorDashboard from "./editor";

export default {
  name: "Dashboard",
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: "adminDashboard"
    };
  },
  computed: {
    ...mapGetters(["roles"])
  },
  created() {
    if (!this.roles.includes("admin")) {
      this.currentRole = "editorDashboard";
    }
  },
  mounted() {
    let userInfo = {
      name: "ks"
    };
   this.localStorage.setItem('userInfo', userInfo)
   this.localStorage.setItem('age', 18, 'userInfo')
    // console.log(localStorage.getItem('userInfo'));
    // localStorage.removeItem()
    // console.log(localStorage.getItem('book'));
  }
};
</script>
