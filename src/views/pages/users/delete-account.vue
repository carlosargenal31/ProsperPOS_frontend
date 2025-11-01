<template>
  <layout-header></layout-header>
  <layout-sidebar></layout-sidebar>
  <div class="page-wrapper">
    <div class="content">
      <div class="page-header">
        <div class="add-item d-flex">
          <div class="page-title">
            <h4>Solicitudes de Eliminación de Cuenta</h4>
          </div>
        </div>
        <ul class="table-top-head">
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Pdf"><img src="@/assets/img/icons/pdf.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Excel"><img src="@/assets/img/icons/excel.svg" alt="img" /></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Imprimir"><i data-feather="printer" class="feather-printer"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Actualizar"><i class="ti ti-refresh"></i></a></li>
          <li><a data-bs-toggle="tooltip" data-bs-placement="top" title="Contraer" id="collapse-header" @click="toggleHeader"><i class="ti ti-chevron-up"></i></a></li>
        </ul>
      </div>
      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
          <div class="search-set">
            <div class="search-input">
              <a href="javascript:void(0);" class="btn-searchset"><i class="ti ti-search fs-14 feather-search"></i></a>
              <input type="search" class="form-control form-control-sm" placeholder="Buscar" />
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table datatable">
              <thead class="thead-light">
                <tr>
                  <th class="no-sort">
                    <label class="checkboxs">
                      <input type="checkbox" id="select-all" />
                      <span class="checkmarks"></span>
                    </label>
                  </th>
                  <th>Nombre de Usuario</th>
                  <th>Fecha de Solicitud</th>
                  <th>Fecha de Eliminación</th>
                  <th class="no-sort"></th>
                </tr>
              </thead>
              <tbody>
                <!-- Los datos vendrían del backend aquí -->
                <tr>
                  <td>
                    <label class="checkboxs">
                      <input type="checkbox" />
                      <span class="checkmarks"></span>
                    </label>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <a href="javascript:void(0);" class="avatar avatar-md me-2">
                        <img src="@/assets/img/users/user-01.jpg" alt="user" />
                      </a>
                      <div><a href="javascript:void(0);">Usuario Ejemplo</a></div>
                    </div>
                  </td>
                  <td>25 Sep 2023</td>
                  <td>01 Oct 2023</td>
                  <td>
                    <div class="edit-delete-action d-flex align-items-center">
                      <a class="p-2 d-flex align-items-center p-1 border rounded" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#delete_modal">
                        <i data-feather="trash-2" class="feather-trash-2"></i>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade modal-default" id="delete_modal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body p-0">
          <div class="success-wrap text-center">
            <form action="#">
              <div class="icon-success bg-danger-transparent text-danger mb-2"><i class="ti ti-trash"></i></div>
              <h3 class="mb-2">Eliminar Solicitud de Cuenta</h3>
              <p class="fs-16 mb-3">¿Está seguro que desea eliminar esta solicitud?</p>
              <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                <button type="button" class="btn btn-md btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-md btn-primary">Sí, Eliminar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    toggleHeader() {
      document.getElementById('collapse-header').classList.toggle('active');
      document.body.classList.toggle('header-collapse');
    },
  },
};
</script>