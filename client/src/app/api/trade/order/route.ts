import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Получаем данные запроса
    const body = await request.json();
    const { instId, tdMode, side, ordType, sz, px } = body;

    // Проверяем обязательные параметры
    if (!instId || !tdMode || !side || !ordType || !sz) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные параметры' },
        { status: 400 }
      );
    }

    // Проверка необходимости указания цены для лимитных ордеров
    if (['limit', 'post_only', 'fok', 'ioc'].includes(ordType) && !px) {
      return NextResponse.json(
        { message: 'Для данного типа ордера необходимо указать цену' },
        { status: 400 }
      );
    }

    // Формируем URL для запроса к серверу
    const serverUrl = 'http://localhost:3001/api/trading/orders';

    // Отправляем запрос к локальному серверу
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Получаем ответ
    const data = await response.json();

    // Если ответ не успешный, возвращаем ошибку
    if (!response.ok) {
      console.error('Ошибка при создании ордера:', data);
      return NextResponse.json(
        { message: data.message || 'Ошибка при создании ордера' },
        { status: response.status }
      );
    }

    // Возвращаем успешный ответ
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
