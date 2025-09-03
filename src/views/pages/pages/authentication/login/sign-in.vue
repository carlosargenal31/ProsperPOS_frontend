<template>
  <div class="main-wrapper">
    <div class="account-content">
      <div class="login-wrapper bg-img">
        <div class="login-content authent-content">
          <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
            <div class="login-userset">
              <div class="login-logo logo-normal">
                <img src="@/assets/img/logo.svg" alt="img" />
              </div>
              <router-link to="/dashboard/" class="login-logo logo-white">
                <img src="@/assets/img/logo-white.svg" alt="Img" />
              </router-link>
              <div class="login-userheading">
                <h3>Sign In</h3>
                <h4 class="fs-16">
                  Access the Dreamspos panel using your email and passcode.
                </h4>
              </div>
              <div class="mb-3">
                <label class="form-label"
                  >Email <span class="text-danger"> *</span></label
                >
                <div class="input-group">
                  <Field
                    name="email"
                    type="text"
                    value="example@dreamstechnologies.com"
                    class="form-control"
                  />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                  <div class="emailshow text-danger" id="email"></div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label"
                  >Password <span class="text-danger"> *</span></label
                >
                <div class="pass-group">
                  <Field
                    name="password"
                    :type="showPassword ? 'text' : 'password'"
                    value="123456"
                    class="form-control pass-input mt-2"
                  />
                  <span @click="toggleShow" class="toggle-password">
                    <i
                      :class="{
                        'fas fa-eye': showPassword,
                        'fas fa-eye-slash': !showPassword,
                      }"
                    ></i>
                  </span>
                  <div class="invalid-feedback">{{ errors.password }}</div>
                  <div class="emailshow text-danger" id="password"></div>
                </div>
              </div>
              <div class="form-login authentication-check">
                <div class="row">
                  <div class="col-12 d-flex align-items-center justify-content-between">
                    <div class="custom-control custom-checkbox">
                      <label
                        class="checkboxs ps-4 mb-0 pb-0 line-height-1 fs-16 text-gray-6"
                      >
                        <input type="checkbox" class="form-control" />
                        <span class="checkmarks"></span>Remember me
                      </label>
                    </div>
                    <div class="text-end">
                      <router-link
                        class="text-orange fs-16 fw-medium"
                        to="/forgot-password"
                        >Forgot Password?</router-link
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-login">
                <button type="submit" class="btn btn-primary w-100">Sign In</button>
              </div>
              <div class="signinform">
                <h4>
                  New on our platform?<router-link to="/register" class="hover-a">
                    Create an account</router-link
                  >
                </h4>
              </div>
              <div class="form-setlogin or-text">
                <h4>OR</h4>
              </div>
              <div class="mt-2">
                <div class="d-flex align-items-center justify-content-center flex-wrap">
                  <div class="text-center me-2 flex-fill">
                    <a
                      href="javascript:void(0);"
                      class="br-10 p-2 btn btn-info d-flex align-items-center justify-content-center"
                    >
                      <img
                        class="img-fluid m-1"
                        src="@/assets/img/icons/facebook-logo.svg"
                        alt="Facebook"
                      />
                    </a>
                  </div>
                  <div class="text-center me-2 flex-fill">
                    <a
                      href="javascript:void(0);"
                      class="btn btn-white br-10 p-2 border d-flex align-items-center justify-content-center"
                    >
                      <img
                        class="img-fluid m-1"
                        src="@/assets/img/icons/google-logo.svg"
                        alt="Facebook"
                      />
                    </a>
                  </div>
                  <div class="text-center flex-fill">
                    <a
                      href="javascript:void(0);"
                      class="bg-dark br-10 p-2 btn btn-dark d-flex align-items-center justify-content-center"
                    >
                      <img
                        class="img-fluid m-1"
                        src="@/assets/img/icons/apple-logo.svg"
                        alt="Apple"
                      />
                    </a>
                  </div>
                </div>
              </div>
              <div
                class="my-4 d-flex justify-content-center align-items-center copyright-text"
              >
                <p>Copyright &copy; 2025 DreamsPOS</p>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from "vue";
import { router } from "@/router";
import { Form, Field } from "vee-validate";
import * as Yup from "yup";
export default {
  components: {
    Form,
    Field,
  },
  data() {
    return {
      showPassword: false,
      password: null,
      emailError: "",
      passwordError: "",
    };
  },
  computed: {
    buttonLabel() {
      return this.showPassword ? "Hide" : "Show";
    },
  },
  methods: {
    toggleShow() {
      this.showPassword = !this.showPassword;
    },
  },
  setup() {
    let users = localStorage.getItem("storedData");
    if (users === null) {
      let password = [
        {
          email: "example@dreamstechnologies.com",
          password: "123456",
        },
      ];
      const jsonData = JSON.stringify(password);
      localStorage.setItem("storedData", jsonData);
    }
    const schema = Yup.object().shape({
      email: Yup.string().required("Email is required").email("Email is invalid"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    });
    const onSubmit = (values) => {
      document.getElementById("email").innerHTML = "";
      document.getElementById("password").innerHTML = "";
      let data = localStorage.getItem("storedData");
      var Pdata = JSON.parse(data);
      const Eresult = Pdata.find(({ email }) => email === values.email);
      if (Eresult) {
        if (Eresult.password === values.password) {
          router.push("/dashboard");
        } else {
          document.getElementById("password").innerHTML = "Incorrect password";
        }
      } else {
        document.getElementById("email").innerHTML = "Email is not valid";
      }
    };
    return {
      schema,
      onSubmit,
      checked: ref(false),
    };
  },
};
</script>
