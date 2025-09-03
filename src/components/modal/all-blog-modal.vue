<template>
  <!-- Add Blog -->
  <div class="modal fade" id="add_blog">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Add Blog</h4>
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
                <div class="new-employee-field">
                  <div class="profile-pic-upload">
                    <div class="profile-pic">
                      <span
                        ><i class="ti ti-circle-plus me-1"></i> Add
                        Image</span
                      >
                    </div>
                    <div class="mb-3">
                      <div class="image-upload mb-0">
                        <input type="file" />
                        <div class="image-uploads">
                          <h4>Upload Image</h4>
                        </div>
                        <p class="mb-0 mt-1 fs-13 no-wrap">
                          Upload an image below 2 MB, Accepted File format JPG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Blog Title<span class="text-danger ms-1">*</span></label
                  >
                  <input type="text" class="form-control" />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"
                    >Category<span class="text-danger ms-1">*</span></label
                  >
                  <vue-select
                    :options="Category"
                    v-model="selected"
                    placeholder="Select"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"
                    >Tags<span class="text-danger ms-1">*</span></label
                  >
                  <input
                    class="input-tags form-control"
                    placeholder="Add new"
                    type="text"
                    data-role="tagsinput"
                    name="Label"
                    value="PointOfSale, RetailTech, POSIntegration"
                  />
                </div>
              </div>
              <div class="col-lg-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Description<span class="text-danger ms-1">*</span></label
                  >
                  <div id="summernote1">
                   <div class="editor pages-editor">
                    <div class="editor three-line">
                      <div class="editor-container">
                        <div ref="editorRef" class="quill-editor" />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
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
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Add Blog</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Add Blog -->

  <!-- Edit Blog -->
  <div class="modal fade" id="edit_blog">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Edit Blog</h4>
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
                <div class="new-employee-field">
                  <div class="profile-pic-upload">
                    <div
                      class="profile-pic edit-review people-profile-pic p-2 border rounded"
                    >
                      <img src="@/assets/img/users/user-08.jpg" alt="Img" />
                      <a href="javascript:void(0);"
                        ><i data-feather="x-square" class="x-square-add"></i
                      ></a>
                    </div>
                    <div class="mb-3">
                      <div class="image-upload mb-0">
                        <input type="file" />
                        <div class="image-uploads">
                          <h4>Upload Image</h4>
                        </div>
                        <p class="mb-0 mt-1 fs-13 no-wrap">
                          Upload an image below 2 MB, Accepted File format JPG, PNG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Blog Title <span class="text-danger"> *</span></label
                  >
                  <input
                    type="text"
                    class="form-control"
                    value="What is a POS System? A Beginner’s Guide"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"
                    >Category <span class="text-danger"> *</span></label
                  >
                  <vue-select
                    :options="Category"
                    v-model="selectedOne"
                    placeholder="Features"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label"
                    >Tags <span class="text-danger"> *</span></label
                  >
                  <input
                    class="input-tags form-control"
                    placeholder="Add new"
                    type="text"
                    data-role="tagsinput"
                    name="Label"
                    value="PointOfSale, RetailTech, POSIntegration"
                  />
                </div>
              </div>

              <div class="col-lg-12">
                <div class="mb-3">
                  <label class="form-label"
                    >Description<span class="text-danger"> *</span></label
                  >
                  <div id="summernote2">
                    <div class="editor pages-editor">
                      <div class="editor three-line">
                        <div class="editor-container">
                          <div ref="editorRefOne" class="quill-editor" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
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
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- /Edit Blog -->

  <!-- Delete Modal -->
  <div class="modal fade" id="delete_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body text-center">
          <span class="avatar avatar-xl bg-soft-danger rounded-circle text-danger mb-3">
            <i class="ti ti-trash-x fs-36"></i>
          </span>
          <h4 class="mb-1">Delete Blog</h4>
          <p class="mb-3">Are you sure you want to delete blog?</p>
          <div class="d-flex justify-content-center">
            <a
              href="javascript:void(0);"
              class="btn btn-secondary me-3"
              data-bs-dismiss="modal"
              >Cancel</a
            >
            <a href="javascript:void(0);" class="btn btn-primary">Yes, Delete</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- /Delete Modal -->
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.snow.css";
export default {
  data() {
    return {
      selected: [],
      selectedOne: [],
      Category: [
        {label: "Select", value: "Select"}, 
        {label: "Evlovution", value: "Evlovution"}, 
        {label: "Guide", value: "Guide"}, 
        {label: "Security", value: "Security"}
      ],
    };
  },
  mounted() {
    this.initQuill();
  },
  methods: {
    submitForm() {
      this.$router.push("/blog/all-blog");
    },
    initQuill() {
      const quill = new Quill(this.$refs.editorRef, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
          ],
        },
      });
      const quillone = new Quill(this.$refs.editorRefone, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
          ],
        },
      });

      quill.on("text-change", () => {
        this.content = quill.root.innerHTML;
      });
      quillone.on("text-change", () => {
        this.content = quillone.root.innerHTML;
      });
    },
  },
};
</script>
