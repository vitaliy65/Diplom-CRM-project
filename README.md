# FixFlo CRM

> CRM-система для управління сервісним центром, побудована на Next.js та Firebase.

---

## Зміст

- [Вимоги](#вимоги)
- [Встановлення](#встановлення)
- [Налаштування середовища](#налаштування-середовища)
- [Запуск](#запуск)

---

## Вимоги

Перед початком переконайтеся, що у вас встановлено:

| Інструмент | Версія       |
|------------|--------------|
| Node.js    | >= 18.x      |
| npm / yarn | >= 9.x       |
| Git        | будь-яка     |

---

## Встановлення

```bash
# 1. Клонувати репозиторій
git clone https://github.com/vitaliy65/Diplom-CRM-project.git

# 2. Перейти до директорії проєкту
cd Diplom-CRM-project

# 3. Встановити залежності
npm install
```

---

## Налаштування середовища

Створіть файл `.env.local` у кореневій директорії та заповніть змінні:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB3CDVXIEHjrTtOjPUJZPdNXjFuC8YQ86g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=diploma-69fb9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=diploma-69fb9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=diploma-69fb9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=512264180504
NEXT_PUBLIC_FIREBASE_APP_ID=1:512264180504:web:3dd34ea7b555fa727b046d

GMAIL_USER=vurbin.official@gmail.com
GMAIL_APP_PASSWORD=pwqt ypid dmxu vxxr
```

---

## Запуск

### Режим розробки

```bash
npm run dev
```

Застосунок буде доступний за адресою: [http://localhost:3000](http://localhost:3000)

### Режим продакшену (локально)

```bash
npm run build
npm run start
```
