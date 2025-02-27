<script setup lang="ts">
import { inject, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import QrScanner from 'qr-scanner';
import DialogBox from './Dialog.vue'
import Manual from './Manual.vue';
import FullLock from './Buttons/FullLock.vue';

import type { submissions, SubmissionState, searchSubmission, Code } from './cloud'
enum Dialogs {
  Manual, Dialog
}

const root = ref<HTMLElement>()
const hasFlash = ref(false)
const doScan = ref(true)
const showInfo = ref(false)
const inversionMode = ref(false)
const dialog = ref<Dialogs>()
const defaultDialog = {
  content: '',
  title: '',
}
const dialogData = ref<{ content: string, title: string, button?: string }>(defaultDialog)

const toasts = ref<{ id: number, message: string }[]>([])
let toastId = 0;
const toastElem = useTemplateRef<HTMLDialogElement[]>('toastElem');
const submissions = inject<submissions>('submissions')!
const searchSubmission = inject<searchSubmission>('searchSubmission')!

const video = useTemplateRef<HTMLVideoElement>('video');
let qrScanner: QrScanner | null = null;
onMounted(() => {
  if (video.value) {
    qrScanner = new QrScanner(video.value, result => {
      checkQR(result.data);
    }, {
      preferredCamera: 'environment',
      highlightScanRegion: true,
      highlightCodeOutline: true,
    });

    qrScanner.start().catch(() => doScan.value = false);
    qrScanner.hasFlash().then(h => hasFlash.value = h)
  }
  function loaded() {
    showToast(`Načteno ${submissions.value.length} přihlášek`)
  }
  if (submissions.value.length) {
    loaded()
  } else {
    const watcher = watch(submissions, (value) => {
      if (value.length) {
        loaded()
        watcher.stop()
      }

    })
  }

  let networkToast: number | undefined
  function offlineToast() {
    if (typeof networkToast === 'undefined') {
      networkToast = showToast('🖧 Bez internetu. Data jsou offline.')
    }
  }
  if (!navigator.onLine) {
    offlineToast()
  }

  window.addEventListener('offline', offlineToast)
  window.addEventListener('online', () => {
    if (typeof networkToast != 'undefined') {
      removeToast(networkToast)
      networkToast = undefined
    }

    showToast('🖧 Připojení obnoveno')
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden === true) {
      qrScanner?.stop()
    } else if (document.hidden === false && doScan.value) {
      qrScanner?.start()
    }
  }, false)
})

watch(doScan, (value) => {
  if (qrScanner) {
    if (value) {
      qrScanner.start();
    } else {
      qrScanner.stop();
    }
  }
})

function removeToast(id: number) {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

function showToast(message: string) {
  const myId = toastId++
  toasts.value.push({ id: myId, message })
  setTimeout(() => {
    removeToast(myId)
  }, 5000)
  nextTick(() => toastElem.value?.[toastElem.value.length - 1].show())
  return myId
}

function displaySubmissionState(state: Code<SubmissionState>[], input: string) {
  if (state.length) {
    let difference = false
    for (let last = state[0], i = 1; i < state.length; last = state[i++]) {
      if (state[i] != last) {
        difference = true
        break
      }
    }

    showDialog(difference ? 'Více výsledků' : state[0].paid ? "Zaplaceno" : "Nezaplaceno", state.map(s => `${s.name ?? ''} ${s.surname ?? ''} (${s.email}, ${s.code}) ${s.paid ? 'má' : 'NEMÁ'} zaplaceno ${s.price}`).join("\n") + `\n[Zadáno ${input}]`);
  } else {
    if (typeof dialog.value === 'undefined') {
      showDialog("Chyba", `Nenalezeno v databázi: ${input}`);
    } else {
      qrScanner?.stop()
      alert(`Nenalezeno v databázi: ${input}`)
      if (doScan.value) qrScanner?.start()
    }
  }
}

function checkQR(input: string) {
  const attrs = input.split('*');
  const byName = Object.fromEntries(attrs.map(attr => attr.split(':')));
  try {
    const response = searchSubmission(byName['MSG'] || input)
    displaySubmissionState(response, byName['MSG'] || input)
  } catch (e) {
    showErrorDialog(e)
  }
}

function showErrorDialog(e: unknown) {
  const message = typeof e == 'object' ? e != null && 'message' in e ? e.message as string : e?.toString() ?? 'Neznámá' : JSON.stringify(e)
  if (typeof dialog === 'undefined')
    showDialog("Chyba", message)
  else
    alert(message)
}

async function fromFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const result = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
    })
    checkQR(result.data);
  }
  if (doScan.value) {
    qrScanner?.start();
  }
}

function showDialog(title: string, content: string, button?: string) {
  qrScanner?.stop()
  dialogData.value = {
    title, content, button
  }
  dialog.value = Dialogs.Dialog
}

function manual(e: SubmitEvent) {
  e.preventDefault()
  const data = new FormData(e.target as HTMLFormElement)
  const name = (data.get('name') as string).trim()
  const surname = (data.get('surname') as string).trim()
  const email = (data.get('email') as string).trim()
  const code = (data.get('code') as string).trim()
  if (!(code || email || name && surname)) {
    alert('Musíte vyplnit alespoň jednu kategorii')
    return
  }

  try {
    let codeResult, emailResult, namesResult;

    if (code) {
      codeResult = searchSubmission(code);
      if (codeResult.length) {
        if (codeResult.some(r => r.paid)) {
          displaySubmissionState(codeResult, code)
          return
        }
      }
    }

    if (email) {
      emailResult = searchSubmission(email, true);
      if (emailResult.length) {
        displaySubmissionState(emailResult, email)
        return
      }
    }

    if (name && surname) {
      namesResult = searchSubmission(name, surname);
      if (namesResult.length) {
        displaySubmissionState(namesResult, `${name} ${surname}`)
        return
      }
    }

    displaySubmissionState(codeResult || emailResult || namesResult || [], code || email || `${name} ${surname}`)
  } catch (e) {
    showErrorDialog(e)
  }
}

function closeDialog() {
  dialog.value = undefined;
  dialogData.value = defaultDialog;
  if (doScan.value) qrScanner?.start()
}

function leadingPlus(value: number) {
  return value > 0 ? `+${value}` : value
}
const lang = navigator.language
declare const __commitMessageTime: string
declare const __commitHash: string
declare const __compileTime: string
declare const __compileTimeZone: string

const commitMessageTime = __commitMessageTime
const commitHash = __commitHash
const compileTime = __compileTime
const compileTimeZone = __compileTimeZone
</script>

<template>
  <div ref="root" style="max-height: 100vh; overflow-y: clip">
    <video ref="video" @dblclick="showInfo = true" playsinline muted>
    </video>

    <div id="buttons">
      <button @click="doScan = !doScan" class="button" style="background: red"
        :title="`${doScan ? 'Zastavit' : 'Spustit'} skenování`">
        {{ doScan ? '⏹' : '▶' }}
      </button>
      <button class="button" v-if="hasFlash" title="Svítilna" @click="qrScanner?.toggleFlash()">🔦</button>
      <button class="button" title="Převrátit bravy" @click="inversionMode = !inversionMode" v-if="showInfo">
        {{ inversionMode ? '🔲' : '🔳' }}
      </button>
      <button class="button" title="Ze souboru..." @click="qrScanner?.stop(); $refs.file.click()">
        <input type="file" @change="fromFile" ref="file" style="display: none;" />
        📂
      </button>
      <button class="button" title="Zadat ručně" @click="qrScanner?.stop(); dialog = Dialogs.Manual">🔤</button>
      <FullLock class="button" :root="root" />
    </div>
    <div class="dialog" v-show="typeof dialog !== 'undefined'">
      <DialogBox v-if="dialog == Dialogs.Dialog" :button="dialogData.button" :title="dialogData.title"
        :content="dialogData.content" @close="closeDialog"></DialogBox>
      <Manual v-if="dialog == Dialogs.Manual" @submit="manual" @close="closeDialog"></Manual>
    </div>
    <dialog class="toast" v-for="toast in toasts" :key="toast.id" ref="toastElem">
      <div>{{ toast.message }}</div>&ensp;
      <button @click="removeToast(toast.id)">OK</button>
    </dialog>
    <small style="position: absolute; top:2px; left:2px; text-align: left;" v-if="showInfo">
      Verze {{ commitHash }} ({{ commitMessageTime }}) <br>
      Sestavena {{ new Date(parseInt(compileTime)).toLocaleString(lang) }}{{ leadingPlus(-parseInt(compileTimeZone) /
        60) }}
    </small>
  </div>
</template>

<style>
#buttons {
  position: absolute;
  left: 50%;
  bottom: 25px;
  transform: translateX(-50%);
  white-space: nowrap;
}

@media screen and (orientation: landscape) {
  #buttons {
    width: 50px;
    display: flex;
    align-items: center;
    flex-direction: column-reverse;
    bottom: 50%;
    transform: translateY(50%);
    right: 50px;
    left: unset;
  }
}

.button {
  border-radius: 100%;
  background: gray;
  border: 0;
  width: 45px;
  height: 45px;
  padding: 0;
}

.dialog {
  position: absolute;
  padding: 2rem;
  z-index: 2;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #262626a4;
  backdrop-filter: blur(2px);
  max-width: 100vw;
}

@media screen and (max-width: 768px) {
  .dialog {
    padding: .5rem;
  }
}

.dialog>* {
  padding: 2rem;
  border-radius: .5rem;
  background: #464646;
}

.toast {
  top: 0;
  left: 0;
  right: 0;
  max-width: 100vw;
  background: #6d6d6d;
  border: 0;
  display: flex;
  justify-content: space-between;
}

video {
  max-width: 100%;
  max-height: 100vh;
}
</style>
