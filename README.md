# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/76fe4ab9-4b38-4203-864e-8c5d8221dac1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/76fe4ab9-4b38-4203-864e-8c5d8221dac1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/76fe4ab9-4b38-4203-864e-8c5d8221dac1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Supabase: cambios para que cada usuario solo vea sus datos

Las consultas de la aplicación ahora filtran por `user_id`, por lo que es importante que Supabase limite el acceso de lectura a los registros del usuario autenticado. Ejecuta estos pasos en el SQL editor de Supabase para reforzar las políticas:

```sql
-- Limitar la lectura de lotes de entrada al usuario propietario
DROP POLICY IF EXISTS "Users can view obrador entry lots" ON public.entry_lots;
CREATE POLICY "Users read only their entry lots" ON public.entry_lots
  FOR SELECT USING (user_id = auth.uid());

-- Limitar lotes de producción
DROP POLICY IF EXISTS "Users can view obrador production batches" ON public.production_batches;
CREATE POLICY "Users read only their production batches" ON public.production_batches
  FOR SELECT USING (user_id = auth.uid());

-- Limitar lotes de salida
DROP POLICY IF EXISTS "Users can view obrador output lots" ON public.output_lots;
CREATE POLICY "Users read only their output lots" ON public.output_lots
  FOR SELECT USING (user_id = auth.uid());

-- Limitar movimientos de stock
DROP POLICY IF EXISTS "Users can view obrador stock movements" ON public.stock_movements;
CREATE POLICY "Users read only their stock movements" ON public.stock_movements
  FOR SELECT USING (user_id = auth.uid());

-- Si mantienes la vista stock_balances, no necesita políticas adicionales
-- porque hereda las de stock_movements (security_invoker = true).
```

Con estas políticas cada usuario solo podrá leer la información que haya registrado, en línea con los filtros aplicados desde el frontend.
