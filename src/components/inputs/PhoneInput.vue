<template>
  <div class="phone-input-pp">
    <div class="input-group" :class="{ 'is-invalid': showError }">
      <button type="button" class="btn btn-outline-secondary d-flex align-items-center gap-1 px-2" @click="open = !open">
        <img :src="flagUrl(country.iso)" width="24" height="18" alt="" class="rounded-1" />
        <span class="small">{{ country.code }}</span>
        <i class="ti ti-chevron-down small"></i>
      </button>
      <input
        type="tel"
        class="form-control"
        :class="{ 'is-invalid': showError }"
        :value="local"
        :placeholder="placeholder"
        :required="required"
        inputmode="numeric"
        @input="onInput"
        @blur="touched = true"
      />
    </div>
    <ul v-if="open" class="dropdown-menu show phone-input-pp__menu">
      <li v-for="c in countries" :key="c.iso">
        <button type="button" class="dropdown-item d-flex align-items-center gap-2" @click="selectCountry(c)">
          <img :src="flagUrl(c.iso)" width="24" height="18" alt="" class="rounded-1" />
          <span>{{ c.name }}</span>
          <span class="text-muted ms-auto">{{ c.code }}</span>
        </button>
      </li>
    </ul>
    <div v-if="showError" class="invalid-feedback d-block">
      Teléfono inválido: debe tener {{ country.len }} dígitos para {{ country.name }}.
    </div>
  </div>
</template>

<script>
import { COUNTRIES, flagUrl, parsePhone, buildPhone, formatLocal } from '@/utils/phone';

export default {
  name: 'PhoneInput',
  props: {
    modelValue: { type: String, default: '' },
    required: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  data() {
    const parsed = parsePhone(this.modelValue);
    return { countries: COUNTRIES, country: parsed.country, local: parsed.local, open: false, touched: false };
  },
  computed: {
    placeholder() {
      return formatLocal('9'.repeat(this.country.len), this.country);
    },
    digits() {
      return this.local.replace(/\D/g, '');
    },
    showError() {
      if (!this.touched) return false;
      if (!this.digits) return this.required;
      return this.digits.length !== this.country.len;
    }
  },
  watch: {
    modelValue(v) {
      if (v === buildPhone(this.country, this.local)) return;
      const parsed = parsePhone(v);
      this.country = parsed.country;
      this.local = parsed.local;
    }
  },
  methods: {
    flagUrl,
    onInput(e) {
      this.local = formatLocal(e.target.value, this.country);
      e.target.value = this.local;
      this.$emit('update:modelValue', buildPhone(this.country, this.local));
    },
    selectCountry(c) {
      this.country = c;
      this.open = false;
      this.local = formatLocal(this.local, c);
      this.$emit('update:modelValue', buildPhone(this.country, this.local));
    }
  }
};
</script>

<style scoped>
.phone-input-pp { position: relative; }
.phone-input-pp__menu { max-height: 260px; overflow-y: auto; width: 100%; top: 100%; left: 0; }
</style>
