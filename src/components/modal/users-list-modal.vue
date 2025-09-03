<template>
  <!-- Add User -->
  <div class="modal fade" id="add-user">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Add User</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body p-3">
              <form @submit.prevent="submitForm">
                <div class="row">
                  <div class="col-lg-12">
                    <div class="new-employee-field">
                      <div class="profile-pic-upload mb-2">
                        <div class="profile-pic">
                          <span><i class="ti ti-circle-plus me-1"></i>Add Image</span>
                        </div>
                        <div class="mb-0">
                          <div class="image-upload mb-0">
                            <input type="file" />
                            <div class="image-uploads">
                              <h4>Upload Image</h4>
                            </div>
                          </div>
                          <p class="fs-13 mt-2">JPEG, PNG up to 2 MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >User<span class="text-danger ms-1">*</span></label
                      >
                      <input type="text" class="form-control" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Role<span class="text-danger ms-1">*</span></label
                      >
                      <vue-select :options="ListUs" v-model="selected" placeholder="Choose" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Email<span class="text-danger ms-1">*</span></label
                      >
                      <input type="email" class="form-control" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Phone<span class="text-danger ms-1">*</span></label
                      >
                      <input type="tel" class="form-control" />
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Password<span class="text-danger ms-1">*</span></label
                      >
                      <div class="pass-group">
                        <input type="password" class="pass-input form-control" />
                        <i class="ti ti-eye-off toggle-password"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Confirm Password<span class="text-danger ms-1">*</span></label
                      >
                      <div class="pass-group">
                        <input type="password" class="pass-input form-control" />
                        <i class="ti ti-eye-off toggle-password"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center"
                    >
                      <span class="status-label">Status</span>
                      <input type="checkbox" id="user1" class="check" checked="" />
                      <label for="user1" class="checktoggle"> </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fs-13 fw-medium p-2 px-3">
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Add User -->

  <!-- Edit User -->
  <div class="modal fade" id="edit-user">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content">
            <div class="modal-header">
              <div class="page-title">
                <h4>Edit User</h4>
              </div>
              <button
                type="button"
                class="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body custom-modal-body p-3">
              <form @submit.prevent="submitForm">
                <div class="row">
                  <div class="col-lg-12">
                    <div class="new-employee-field">
                      <div class="profile-pic-upload image-field">
                        <div class="profile-pic p-2">
                          <img
                            src="@/assets/img/users/user-49.png"
                            class="object-fit-cover h-100 rounded-1"
                            alt="user"
                          />
                          <button type="button" class="close rounded-1">
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div class="mb-3">
                          <div class="image-upload mb-0">
                            <input type="file" />
                            <div class="image-uploads">
                              <h4>Change Image</h4>
                            </div>
                          </div>
                          <p class="mt-2">JPEG, PNG up to 2 MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >User<span class="text-danger ms-1">*</span></label
                      >
                      <input type="text" class="form-control" value="Henry Bryant" />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Role<span class="text-danger ms-1">*</span></label
                      >
                      <vue-select
                        :options="ListUsOne"
                        v-model="selectedOne"
                        placeholder="Admin"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Email<span class="text-danger ms-1">*</span></label
                      >
                      <input
                        type="email"
                        class="form-control"
                        value="henry@example.com"
                      />
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div class="mb-3">
                      <label class="form-label"
                        >Phone<span class="text-danger ms-1">*</span></label
                      >
                      <input type="tel" class="form-control" value="+12498345785" />
                    </div>
                  </div>

                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Password<span class="text-danger ms-1">*</span></label
                      >
                      <div class="pass-group">
                        <input
                          type="password"
                          class="pass-input form-control"
                          value="********"
                        />
                        <i class="ti ti-eye-off toggle-password"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-6">
                    <div class="mb-3">
                      <label class="form-label"
                        >Confirm Password<span class="text-danger ms-1">*</span></label
                      >
                      <div class="pass-group">
                        <input
                          type="password"
                          class="pass-input form-control"
                          value="********"
                        />
                        <i class="ti ti-eye-off toggle-password"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-lg-12">
                    <div
                      class="status-toggle modal-status d-flex justify-content-between align-items-center"
                    >
                      <span class="status-label">Status</span>
                      <input type="checkbox" id="user2" class="check" checked="" />
                      <label for="user2" class="checktoggle"> </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fs-13 fw-medium p-2 px-3">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Edit User -->

  <!-- delete modal -->
  <div class="modal fade" id="delete-modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="page-wrapper-new p-0">
          <div class="content p-5 px-3 text-center">
            <span class="rounded-circle d-inline-flex p-2 bg-danger-transparent mb-2"
              ><i class="ti ti-trash fs-24 text-danger"></i
            ></span>
            <h4 class="fs-20 fw-bold mb-2 mt-1">Delete User</h4>
            <p class="mb-0 fs-16">Are you sure you want to delete user?</p>
            <div class="modal-footer-btn mt-3 d-flex justify-content-center">
              <button
                type="button"
                class="btn me-2 btn-secondary fs-13 fw-medium p-2 px-3 shadow-none"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary fs-13 fw-medium p-2 px-3">
                Yes Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      selected: [],
      selectedOne: [],
      ListUs: [
        {label: "Choose", value: "Choose"}, 
        {label: "Manager", value: "Manager"}, 
        {label: "Admin", value: "Admin"}
      ],
      ListUsOne: [
        {label: "Admin", value: "Admin"}, 
        {label: "Manager", value: "Manager"}, 
        {label: "Store Keeper", value: "Store Keeper"}, 
      ],
    };
  },
  methods: {
    submitForm() {
      this.$router.push("/users/users-list");
    },
  },
};
</script>
