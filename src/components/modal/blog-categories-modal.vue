<template>
  <!-- Add Tag -->
  <div class="modal fade" id="add_blog-category">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Add Category</h4>
          <button
            type="button"
            class="btn-close custom-btn-close p-0"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i class="ti ti-x"></i>
          </button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body pb-0">
            <div class="row">
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Category<span class="text-danger ms-1">*</span></label
                  >
                  <input
                    class="input-tags form-control"
                    type="text"
                    data-role="tagsinput"
                    name="Label"
                  />
                </div>
              </div>
              <div class="col-md-12">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <label class="form-label">Status</label>
                  <label class="switch">
                    <input type="checkbox" checked />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary border me-2"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Add Tag</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Add Tag -->

  <!-- Edit Tag -->
  <div class="modal fade" id="edit_blog-category">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Edit Category</h4>
          <button
            type="button"
            class="btn-close custom-btn-close p-0"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i class="ti ti-x"></i>
          </button>
        </div>
        <form @submit.prevent="submitForm">
          <div class="modal-body pb-0">
            <div class="row">
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Category<span class="text-danger ms-1">*</span></label
                  >
                  <input
                    class="input-tags form-control"
                    type="text"
                    data-role="tagsinput"
                    name="Label"
                    value="Innovations"
                  />
                </div>
              </div>
              <div class="col-md-12">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <label class="form-label">Status</label>
                  <label class="switch">
                    <input type="checkbox" checked />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary border me-2"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Edit Tag -->

  <!-- Delete Modal -->
  <div class="modal fade" id="delete_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center">
          <span class="avatar avatar-xl bg-soft-danger rounded-circle text-danger mb-3">
            <i class="ti ti-trash-x fs-36"></i>
          </span>
          <h4 class="mb-1">Delete Category</h4>
          <p class="mb-3">Are you sure you want to delete category?</p>
          <div class="d-flex justify-content-center">
            <a
              href="javascript:void(0);"
              class="btn btn-secondary me-3"
              data-bs-dismiss="modal"
              >Cancel</a
            >
            <router-link to="/blog/blog-categories" class="btn btn-primary"
              >Yes, Delete</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Delete Modal -->
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {
    submitForm() {
      this.$router.push("/blog/blog-categories");
    },
  },
};
</script>
