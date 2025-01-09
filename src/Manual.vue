<template>
    <form>
        <small>Zadejte alespoň jeden typ údajů z přihlášky</small>
        <fieldset>
            <legend>Jméno a příjmení</legend>
            <p><label for="name">Jméno/a</label>
                <input type="text" name="name" id="name" placeholder="Jméno">
            </p>

            <p>
                <label for="surname">Příjmení</label>
                <input type="text" name="surname" id="surname" placeholder="Příjmení">
            </p>
        </fieldset>

        <fieldset>
            <legend>Kontaktní email</legend>
            <p>
                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder="email@example.com">
            </p>
        </fieldset>

        <fieldset>
            <legend>Kód</legend>
            <p>
                <label for="code">Kód přihlášky</label>
                <input type="code" name="code" id="code" placeholder="uAbc123">
            </p>
        </fieldset>

        <button type="submit">✅ Zkontrolovat</button>
        <button type="reset">🗑️ Vymazat</button>
        <button type="button" @click="e('close')">❌ Zavřít</button>
    </form>
</template>

<script setup lang="ts">
const e = defineEmits<{
    close: []
}>()
</script>

<style>
form p {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 500px;
    column-gap: .5rem;
}

form p label {
    white-space: nowrap;
}

form p input {
    flex-basis: 80%;
}

form fieldset {
    border-radius: .5rem;
    border-color: #ffffff5d;
}
</style>