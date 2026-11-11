<template>
  <div>
    <div class="input-group">
      <select class="form-select flex-grow-0" style="width: 120px" v-model="type" @change="onTypeChange">
        <option value="dni">DNI</option>
        <option value="pasaporte">Pasaporte</option>
      </select>
      <input
        type="text"
        class="form-control"
        :class="{ 'is-invalid': showError }"
        :value="modelValue"
        :placeholder="type === 'dni' ? '0801-1990-12345' : 'Ej: A1234567'"
        :maxlength="type === 'dni' ? 15 : 15"
        :required="required"
        @input="onInput"
        @blur="touched = true"
      />
    </div>
    <div v-if="showError" class="invalid-feedback d-block">
      {{ type === 'dni' ? 'El DNI debe tener 13 dígitos (0801-1990-12345).' : 'El pasaporte debe tener de 6 a 15 letras o números.' }}
    </div>
  </div>
</template>

<script>
import { formatDni, detectDocType, isValidIdDocument } from '@/utils/phone';

export default {
  name: 'IdDocumentInput',
  props: {
    modelValue: { type: String, default: '' },
    required: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  data() {
    return { type: detectDocType(this.modelValue), touched: false };
  },
  computed: {
    showError() {
      return this.touched && !isValidIdDocument(this.modelValue, this.type, this.required);
    }
  },
  methods: {
    onInput(e) {
      const raw = e.target.value;
      const value = this.type === 'dni'
        ? formatDni(raw)
        : raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 15);
      e.target.value = value;
      this.$emit('update:modelValue', value);
    },
    onTypeChange() {
      this.touched = false;
      this.$emit('update:modelValue', '');
    }
  }
};
</script>
